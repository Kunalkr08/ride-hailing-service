# Ride Hailing Service

A NestJS + TypeScript backend for a simplified ride-hailing platform similar to Uber/Ola.

The service supports user and driver registration, nearby-driver matching, ride booking, tiered pricing, coupon discounts, driver location updates, and ride history.

## Tech Stack

* Node.js
* TypeScript
* NestJS
* REST APIs
* Swagger / OpenAPI
* Jest
* class-validator
* In-memory storage using JavaScript `Map`

## Features

* Register users
* Register drivers
* Update driver location
* Find the nearest available driver within a configurable radius
* Book rides
* Hatchback → Sedan upgrade when no eligible Hatchback is available
* Update driver availability during an ongoing ride
* End rides and calculate fares
* Tiered distance-based pricing
* Different pricing for Hatchback and Sedan
* Minimum fare
* Coupon creation, validation, deletion and application
* User ride history
* Driver ride history
* Automated unit tests for pricing, ride booking and geographical calculations
* Swagger API documentation

---

## Project Structure

```text
src/
├── common/
│   ├── types.ts
│   ├── geo.ts
│   └── id.ts
│
├── users/
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── drivers/
│   ├── dto/
│   ├── drivers.controller.ts
│   ├── drivers.service.ts
│   └── drivers.module.ts
│
├── coupons/
│   ├── dto/
│   ├── coupons.controller.ts
│   ├── coupons.service.ts
│   └── coupons.module.ts
│
├── pricing/
│   ├── pricing.types.ts
│   ├── tiered-pricing.strategy.ts
│   ├── pricing.service.ts
│   └── pricing.module.ts
│
└── rides/
    ├── dto/
    ├── rides.controller.ts
    ├── history.controller.ts
    ├── rides.service.ts
    └── rides.module.ts
```

### Architecture

`RideService` acts as the orchestration layer.

```text
                    RideController
                          |
                          v
                     RideService
                    /     |      \
                   /      |       \
                  v       v        v
        DriverService  PricingService  CouponService
             |             |               |
             v             v               v
        Driver data    Pricing rules   Coupon data
```

Responsibilities are intentionally separated:

* **RideService** — coordinates booking and ride completion.
* **DriverService** — manages drivers, availability, locations and matching.
* **PricingService** — calculates fares.
* **CouponService** — manages and validates coupons.
* **UsersService** — manages users.
* **Geo utilities** — calculates geographical distance using the Haversine formula.

This separation makes it easier to change pricing, matching or persistence without rewriting the complete booking flow.

---

# Getting Started

## Prerequisites

* Node.js 18+
* npm

## Installation

```bash
npm install
```

## Run in development

```bash
npm run start:dev
```

The application will start on:

```text
http://localhost:3000
```

## Swagger

Swagger documentation is available at:

```text
http://localhost:3000/api
```

Swagger can be used to execute and test all available APIs directly from the browser.

---

# Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The tests cover:

* Pricing tiers
* Minimum fare
* Different vehicle types
* Coupon discounts
* Geographical distance calculation
* Ride booking
* Driver availability
* Hatchback → Sedan fallback
* Ride completion

---

# API Overview

## Users

### Register User

```http
POST /users
```

Example:

```json
{
  "name": "Kunal Kumar",
  "phone": "+919876543210"
}
```

---

## Drivers

### Register Driver

```http
POST /drivers
```

Example:

```json
{
  "name": "Rahul",
  "phone": "+919876543211",
  "carType": "HATCHBACK",
  "lat": 12.9716,
  "lng": 77.5946
}
```

### Update Driver Location

```http
PATCH /drivers/:id/location
```

Example:

```json
{
  "lat": 12.9718,
  "lng": 77.5948
}
```

---

## Coupons

### Create Coupon

```http
POST /coupons
```

Example:

```json
{
  "code": "SAVE10",
  "percentage": 10
}
```

### Delete Coupon

```http
DELETE /coupons/:code
```

---

## Rides

### Book Ride

```http
POST /rides
```

Example:

```json
{
  "userId": "USER_ID",
  "carType": "HATCHBACK",
  "pickupLat": 12.9717,
  "pickupLng": 77.5947,
  "couponCode": "SAVE10"
}
```

The system:

1. Validates the user.
2. Searches for an available driver within the configured radius.
3. Selects the nearest eligible driver.
4. Falls back from Hatchback to Sedan if necessary.
5. Reserves the selected driver.
6. Validates the coupon.
7. Creates the ongoing ride.

### End Ride

```http
POST /rides/:rideId/end
```

Example:

```json
{
  "distanceKm": 10
}
```

The system calculates the fare, applies the coupon, marks the ride as completed and makes the driver available again.

---

# Pricing

The pricing model uses progressive distance tiers.

### Sedan

| Distance   |   Rate |
| ---------- | -----: |
| First 2 km | ₹10/km |
| Next 3 km  |  ₹8/km |
| Above 5 km |  ₹5/km |

Minimum fare:

```text
₹50
```

### Hatchback

The assignment requires different rates for Hatchback and Sedan but does not specify the exact Hatchback rates.

For this implementation, the following rates are assumed:

| Distance   |  Rate |
| ---------- | ----: |
| First 2 km | ₹8/km |
| Next 3 km  | ₹6/km |
| Above 5 km | ₹4/km |

These values are isolated inside the pricing strategy so they can easily be changed.

### Example

For a 10 km Sedan ride:

```text
First 2 km:
2 × ₹10 = ₹20

Next 3 km:
3 × ₹8 = ₹24

Remaining 5 km:
5 × ₹5 = ₹25

Base fare:
₹20 + ₹24 + ₹25 = ₹69
```

With a 10% coupon:

```text
₹69 - 10% = ₹62.10
```

For a 1 km ride:

```text
1 × ₹10 = ₹10

Minimum fare = ₹50

Final fare = ₹50
```

---

# Design Assumptions

## 1. In-memory storage

The assignment explicitly permits in-memory storage.

JavaScript `Map` is used instead of introducing a database.

In a production system, these stores would be replaced with repositories backed by PostgreSQL or another persistent database.

---

## 2. Driver matching radius

The matching radius is assumed to be:

```text
5 km
```

Only available drivers within this radius are considered.

Among eligible drivers, the nearest driver is selected.

The radius is configurable in `RideService` rather than being spread throughout the codebase.

---

## 3. Driver availability

A driver follows this lifecycle:

```text
Available
   |
   | Book ride
   v
Unavailable
   |
   | End ride
   v
Available
```

The driver is marked unavailable as soon as a ride is successfully reserved.

If booking fails after the driver has been reserved, availability is rolled back.

---

## 4. Hatchback upgrade

If the customer requests a Hatchback but no eligible Hatchback is available, the system searches for an eligible Sedan.

The upgrade is provided at no additional charge.

The reverse downgrade is not performed:

```text
HATCHBACK → SEDAN
```

but not:

```text
SEDAN → HATCHBACK
```

---

## 5. Ride distance

For simplicity, `distanceKm` is provided when ending the ride.

In a production ride-hailing system, distance should not be trusted from the client.

A production implementation would use GPS/location history and calculate the travelled distance using the recorded route.

---

## 6. Coupon

Coupons currently support percentage-based discounts.

The coupon is validated before the ride is successfully created.

If an invalid coupon is supplied, the booking fails and the temporarily reserved driver is released.

---

## 7. Concurrency

The assignment uses in-memory storage, so the implementation is intentionally simplified for the scope of the task.

In production, driver assignment should be protected using a database transaction or atomic update to prevent two concurrent requests from booking the same driver.

For example, the availability update should be performed atomically:

```text
UPDATE driver
SET available = false
WHERE id = ?
AND available = true
```

Only one concurrent request should be allowed to successfully reserve the driver.

---

# Pricing Design

Pricing is separated behind a strategy abstraction.

```text
RideService
     |
     v
PricingService
     |
     v
PricingStrategy
     |
     v
TieredPricingStrategy
```

This allows new pricing models to be introduced without changing ride-booking logic.

For example, future strategies could include:

```text
TieredPricingStrategy
SurgePricingStrategy
WeekendPricingStrategy
AirportPricingStrategy
```

---

# Matching Design

Driver matching is currently based on the nearest available driver.

The matching logic is isolated inside the driver layer so that it can be extended later.

Possible future strategies:

```text
NearestDriverStrategy
HighestRatedDriverStrategy
ShortestETA Strategy
```

This would allow the system to change driver selection without modifying the rest of the booking workflow.

---

# Trade-offs

### In-memory storage

**Advantage:**

* Very simple
* Fast to implement
* Sufficient for the assignment

**Trade-off:**

* Data is lost when the application restarts
* Doesn't support multiple application instances

### Client-provided distance

**Advantage:**

* Keeps the assignment implementation simple
* Allows pricing logic to be demonstrated without a mapping/GPS service

**Trade-off:**

* Cannot be trusted in production

### Simple nearest-driver matching

**Advantage:**

* Easy to understand
* Deterministic
* Easy to test

**Trade-off:**

* Doesn't account for traffic, ETA, driver rating or road network

---

# Possible Production Improvements

If this were extended into a production system, I would consider:

* PostgreSQL for persistent storage
* Redis for frequently accessed driver/location data
* Atomic driver reservation using transactions/locking
* GPS/location streaming
* Real route-distance calculation
* ETA-based driver matching
* Surge pricing
* Ride cancellation
* Payment integration
* Authentication and authorization
* Event-driven ride state changes
* Horizontal scaling
* Observability and distributed tracing

These are intentionally outside the scope of this 2-hour implementation.

---

# AI Assistance

AI was used as a development assistant during the implementation.

It was used for:

* Discussing architecture and module boundaries
* Reviewing implementation decisions
* Identifying edge cases
* Generating/brainstorming test scenarios
* Debugging TypeScript/NestJS issues
* Improving documentation

All implementation decisions were reviewed and understood before being included in the project.

The core design decisions, assumptions and trade-offs were evaluated against the assignment requirements.

---

# Demo Flow

A recommended demo sequence is:

1. Register a user.
2. Register a Hatchback driver.
3. Register/update a nearby Sedan driver.
4. Create a coupon.
5. Request a Hatchback.
6. Demonstrate Hatchback → Sedan fallback.
7. End the ride.
8. Demonstrate tiered pricing.
9. Demonstrate coupon discount.
10. Demonstrate minimum fare.
11. Show user/driver ride history.
12. Run automated tests.
13. Explain architecture and production improvements.

---

# License

This project was created as part of a backend engineering task/assessment.
