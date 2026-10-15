import UserRole from "./enum/userRole.js";

export default class User {
  private id?: number;
  private name: string;
  private lastName: string;
  private dni: string;
  private cuit?: string;
  private address?: string;
  private neighborhood?: string;
  private city?: string;
  private postalCode?: string;
  private country?: string;
  private email: string;
  private password: string;
  private phone?: string;
  private active: boolean;
  private role: UserRole;

  constructor(
    id: number | undefined,
    name: string,
    lastName: string,
    dni: string,
    email: string,
    password: string,
    role: UserRole,
    active: boolean = true,
    cuit?: string,
    address?: string,
    neighborhood?: string,
    city?: string,
    postalCode?: string,
    country?: string,
    phone?: string
  ) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.dni = dni;
    this.cuit = cuit;
    this.address = address;
    this.neighborhood = neighborhood;
    this.city = city;
    this.postalCode = postalCode;
    this.country = country;
    this.email = email;
    this.password = password;
    this.active = active;
    this.role = role;
  }

  getId(): number | undefined { return this.id; }
  setId(value: number): void { this.id = value; }

  getName(): string { return this.name; }
  setName(value: string): void { this.name = value; }

  getLastName(): string { return this.lastName; }
  setLastName(value: string): void { this.lastName = value; }

  getDni(): string { return this.dni; }
  setDni(value: string): void { this.dni = value; }

  getCuit(): string | undefined { return this.cuit; }
  setCuit(value: string): void { this.cuit = value; }

  getAddress(): string | undefined { return this.address; }
  setAddress(value: string): void { this.address = value; }

  getNeighborhood(): string | undefined { return this.neighborhood; }
  setNeighborhood(value: string): void { this.neighborhood = value; }

  getCity(): string | undefined { return this.city; }
  setCity(value: string): void { this.city = value; }

  getPostalCode(): string | undefined { return this.postalCode; }
  setPostalCode(value: string): void { this.postalCode = value; }

  getCountry(): string | undefined { return this.country; }
  setCountry(value: string): void { this.country = value; }

  getEmail(): string { return this.email; }
  setEmail(value: string): void { this.email = value; }

  getPassword(): string { return this.password; }
  setPassword(value: string): void { this.password = value; }

  getPhone(): string | undefined { return this.phone; }
  setPhone(value: string): void { this.phone = value; }

  getRole(): UserRole { return this.role; }
  setRole(value: UserRole): void { this.role = value; }

  getActive(): boolean { return this.active; }
  setActive(value: boolean): void { this.active = value; }

  toString(): string {
    return `User(id=${this.id}, name=${this.name} ${this.lastName}, email=${this.email}, role=${this.role})`;
  }
}
