export interface User {
    userId: string;
    username: string;
    createdAt: Date;
    theme: 'dark' | 'light';
}

export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}
