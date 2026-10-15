interface AuthResponseDTO {
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export default AuthResponseDTO;
