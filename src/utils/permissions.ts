//utils/permissions.ts
export const canEditOperation = (role?: string) => {
    return role === 'manager' || role === 'agent';
};

export const canManagerOperation = (role?: string) => {
    return role === 'manager' || role === 'admin';
}

export const canManagerRapport = (role?: string) => {
    return role === 'manager' || role == 'comptable';
};