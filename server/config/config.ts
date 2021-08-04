interface NamedParam {
  password: string;
  port: number;
  mongodbURL: string;
}

export class Config {
  password: string;
  port: number;
  mongodbURL: string;

  constructor({ password, port, mongodbURL }: NamedParam) {
    this.password = password;
    this.port = port;
    this.mongodbURL = mongodbURL;
  }

  /**
   * Get configuration from environment
   */
  static fromEnvironment() {
    return new Config({
      port: parseInt(process.env.port ?? '3000'),
      password: process.env.password ?? 'password',
      mongodbURL: process.env.mongodbURL ?? '',
    });
  }
}
