interface AddressResponseDTO {
  customerId: number;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

export default AddressResponseDTO;
