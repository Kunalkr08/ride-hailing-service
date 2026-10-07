# Ride Hailing Service

NestJS + TypeScript machine-coding solution for a ride-hailing backend.

## Run

```bash
npm install
npm run start:dev
```

Tests:

```bash
npm test
```

## API

### Users
- `POST /users`

```json
{ "name": "Kunal", "phone": "+919999999999" }
```

### Drivers
- `POST /drivers`
- `PATCH /drivers/:id/location`

```json
{ "name": "Ravi", "phone": "+918888888888", "carType": "SEDAN", "lat": 12.9716, "lng": 77.5946 }
```

### Coupons
- `POST /coupons`
- `DELETE /coupons/:code`

Example:

```json
{ "code": "SAVE10", "percentage": 10, "maxDiscount": 100 }
```

### Rides
- `POST /rides`
- `POST /rides/:id/end`
- `GET /rides/:id`
- `GET /users/:id/rides`
- `GET /drivers/:id/rides`

Book:

```json
{
  "userId": "...",
  "carType": "HATCHBACK",
  "pickupLat": 12.9716,
  "pickupLng": 77.5946,
  "couponCode": "SAVE10"
}
```

End:

```json
{ "distanceKm": 10 }
```

## Assumptions / decisions

1. Storage is in-memory because persistence is explicitly optional for the exercise.
2. Driver search radius is 5 km.
3. Matching chooses the nearest available driver of the requested type. For a Hatchback request, if no Hatchback is available in range, the nearest Sedan is selected with no upgrade fee.
4. A driver can have only one ongoing ride.
5. A ride is charged when it ends because the final distance is known then.
6. Pricing tiers are progressive, not a single rate for the entire distance:
   - Sedan: first 2 km ₹10/km, next 3 km ₹8/km, above 5 km ₹5/km.
   - Hatchback: first 2 km ₹8/km, next 3 km ₹6/km, above 5 km ₹4/km.
7. Minimum fare is ₹50 for both car types.
8. Coupons are percentage discounts with an optional maximum discount. Coupon validation happens at booking; the coupon is applied at ride completion.
9. No payment processing, authentication, persistent locking, maps provider, or real-time driver tracking was implemented because they are outside the stated scope.
10. Coordinates use latitude/longitude and the Haversine formula for radius matching.

## Design

`RidesService` is the application-level orchestrator. It coordinates user validation, driver matching, coupon validation, ride lifecycle, and pricing without embedding pricing formulas or geospatial calculations.

- `drivers/` owns driver state, availability, location and nearest-driver selection.
- `pricing/` owns fare calculation. `TieredPricingStrategy` is isolated so another pricing strategy can be added without changing ride booking.
- `coupons/` owns coupon lifecycle and validation.
- `rides/` owns ride lifecycle and history.
- `common/` contains shared domain types and geospatial calculation.

## Trade-offs / with more time

- Replace maps with PostgreSQL repositories.
- Use PostGIS or a geo-index for scalable driver lookup.
- Add optimistic/pessimistic locking or a distributed lock for concurrent driver booking.
- Introduce an explicit `MatchingStrategy` interface so nearest-driver and highest-rated-driver strategies can be switched through configuration.
- Add authentication/authorization, idempotency keys, pagination, structured logging and API documentation.
- Add integration/e2e tests and persistence-level tests.

## AI usage

AI was used for boilerplate generation, DTOs, NestJS module wiring and initial test scaffolding. The generated code was reviewed and simplified around the domain boundaries. Pricing assumptions, upgrade behaviour, radius matching, coupon semantics and the in-memory trade-off were explicitly chosen for this exercise. Tests were written around the mandatory pricing and upgrade requirements rather than relying only on generated code.

## Demo flow

A simple 30-minute demo can be driven entirely through the API:

1. Register one user and two drivers near the pickup point.
2. Add `SAVE10` coupon.
3. Book a Hatchback while only a Sedan is available and show `requestedCarType=HATCHBACK` and `assignedCarType=SEDAN`.
4. End the ride with 10 km and show the calculated fare and coupon discount.
5. Fetch both user and driver history.
6. Move all available drivers far away and demonstrate the no-driver case.
7. Try an invalid coupon and show the request is rejected.

## AI note for the demo

The important point to communicate is not "AI generated the project". Explain that AI accelerated repetitive NestJS boilerplate, while the domain decisions were reviewed manually: progressive tiers, minimum fare, 5 km matching radius, free Sedan upgrade, coupon validation timing, and the in-memory persistence trade-off.
