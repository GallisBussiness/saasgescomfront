export interface LoginInterface {
    email: string;
    password: string;
}

export interface PasswordUpdateInterface {
    oldPassword?: string;
    newPassword: string;
}

export interface PasswordResetRequestInterface {
    email: string;
    callbackURL?: string;
}

export interface PasswordResetInterface {
    token: string;
    newPassword: string;
}