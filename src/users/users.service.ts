import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { newId } from '../common/id';
import { User } from '../common/types';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  register(dto: RegisterUserDto): User {
    if ([...this.users.values()].some(u => u.phone === dto.phone)) {
      throw new ConflictException('Phone number already registered');
    }
    const user: User = { id: newId(), ...dto };
    this.users.set(user.id, user);
    return user;
  }

  getById(id: string): User {
    const user = this.users.get(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
