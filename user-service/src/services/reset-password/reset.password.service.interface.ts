export default interface ResetPasswordService {
  reset(email: string, newPassword: string): Promise<void>;
}
