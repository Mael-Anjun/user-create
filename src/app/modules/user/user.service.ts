import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { MongoService } from '../../db/db';

@Injectable()
export class UserService {
  constructor(readonly mongoService: MongoService) {}

  async createUser(user: UserTypes): Promise<UserTypes> {
    const response = await fetch('https://reqres.in/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    const createdUser = await response.json();
    console.log(createdUser);

    const message = JSON.stringify(createdUser);
    const queue = 'user.created';

    try {
      const conn = await amqp.connect('amqp://localhost');
      const channel = await conn.createChannel();
      await channel.assertQueue(queue);
      channel.sendToQueue(queue, Buffer.from(message));
    } catch (error) {
      console.error(error);
    }

    return createdUser;
  }

  async sendEmail(email: string, message: string): Promise<any> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'yourgmail@gmail.com',
        pass: 'yourpassword',
      },
    });

    const info = await transporter.sendMail({
      from: '"Your Name" <yourgmail@gmail.com>',
      to: email,
      subject: 'User created successfully!',
      text: message,
    });

    return info;
  }

  async getById(userId: string): Promise<UserTypes> {
    const response = await fetch(`https://reqres.in/api/users/${userId}`);
    const data = await response.json();
    return data.data;
  }

  async getAvatar(userId: string): Promise<string> {
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const imagePath = `./avatars/${hash}.jpg`;

    if (existsSync(imagePath)) {
      const imageBuffer = readFileSync(imagePath);
      return imageBuffer.toString('base64');
    } else {
      const db = await this.mongoService.getDb();
      const collection = db.collection('users');
      const user = await collection.findOne({ id: userId });

      if (!user?.avatar) {
        return 'error';
      }

      const imageBuffer = Buffer.from(user.avatar, 'base64');
      writeFileSync(imagePath, imageBuffer);

      return user.avatar;
    }
  }
}
