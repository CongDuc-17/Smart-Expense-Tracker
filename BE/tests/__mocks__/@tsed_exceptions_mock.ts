export class Exception extends Error {
  constructor(message?: any) {
    super(typeof message === 'string' ? message : JSON.stringify(message));
    this.name = 'Exception';
  }
}

export class ClientException extends Exception {
  public status: number;
  constructor(status: number, message?: any) {
    super(typeof message === 'string' ? message : JSON.stringify(message));
    this.name = 'ClientException';
    this.status = status;
  }
}

export class ServerException extends ClientException {
  constructor(status: number, message?: any) {
    super(status, message);
    this.name = 'ServerException';
  }
}
