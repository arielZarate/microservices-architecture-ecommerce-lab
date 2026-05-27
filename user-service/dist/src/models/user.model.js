export default class User {
    id;
    name;
    lastName;
    dni;
    cuit;
    address;
    neighborhood;
    city;
    postalCode;
    country;
    email;
    password;
    phone;
    active;
    role;
    constructor(id, name, lastName, dni, email, password, role, active = true, cuit, address, neighborhood, city, postalCode, country, phone) {
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
    getId() { return this.id; }
    setId(value) { this.id = value; }
    getName() { return this.name; }
    setName(value) { this.name = value; }
    getLastName() { return this.lastName; }
    setLastName(value) { this.lastName = value; }
    getDni() { return this.dni; }
    setDni(value) { this.dni = value; }
    getCuit() { return this.cuit; }
    setCuit(value) { this.cuit = value; }
    getAddress() { return this.address; }
    setAddress(value) { this.address = value; }
    getNeighborhood() { return this.neighborhood; }
    setNeighborhood(value) { this.neighborhood = value; }
    getCity() { return this.city; }
    setCity(value) { this.city = value; }
    getPostalCode() { return this.postalCode; }
    setPostalCode(value) { this.postalCode = value; }
    getCountry() { return this.country; }
    setCountry(value) { this.country = value; }
    getEmail() { return this.email; }
    setEmail(value) { this.email = value; }
    getPassword() { return this.password; }
    setPassword(value) { this.password = value; }
    getPhone() { return this.phone; }
    setPhone(value) { this.phone = value; }
    getRole() { return this.role; }
    setRole(value) { this.role = value; }
    getActive() { return this.active; }
    setActive(value) { this.active = value; }
    toString() {
        return `User(id=${this.id}, name=${this.name} ${this.lastName}, email=${this.email}, role=${this.role})`;
    }
}
//# sourceMappingURL=user.model.js.map