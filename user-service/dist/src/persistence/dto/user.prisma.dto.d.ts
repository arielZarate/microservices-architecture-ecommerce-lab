type UserPrismaResponse = {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    cuit: string | null;
    address: string | null;
    neighborhood: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    email: string;
    password: string;
    phone: string | null;
    role: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
export default UserPrismaResponse;
//# sourceMappingURL=user.prisma.dto.d.ts.map