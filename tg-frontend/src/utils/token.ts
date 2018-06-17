class Token {
  private readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  public read(): string | null {
    return window.localStorage.getItem(this.id);
  }

  public write(token: string) {
    window.localStorage.setItem(this.id, token);
  }

  public clear() {
    window.localStorage.removeItem(this.id);
  }
}

export default new Token('jsonWebToken');