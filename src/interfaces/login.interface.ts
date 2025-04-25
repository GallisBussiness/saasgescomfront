export interface LoginInterface {
    email: string;
    password: string;
}

export interface PasswordUpdateInterface {
    oldPassword?: string;
    newPassword: string;
}