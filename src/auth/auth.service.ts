import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  // Validate user for login
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  // Login and generate JWT token
  async login(user: User) {
    const payload = { sub: user._id, username: user.username, role: user.role };
    return {
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        initials: this.getInitials(user.name),
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  // Register new user
  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ username: registerDto.username }).exec();
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create initials
    const initials = this.getInitials(registerDto.name);
    
    // Create new user
    const newUser = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      initials,
    });
    
    const savedUser = await newUser.save();
    
    // Return user without password
    return {
      id: savedUser._id,
      username: savedUser.username,
      name: savedUser.name,
      role: savedUser.role,
      initials: savedUser.initials,
    };
  }

  // Get user profile
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      initials: user.initials || this.getInitials(user.name),
    };
  }

  // Helper to generate initials from name
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}