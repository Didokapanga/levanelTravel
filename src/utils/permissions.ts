export const canEditOperation = (role?: string) => {
    return role === 'manager' || role === 'agent';
};

export const canManagerOperation = (role?: string) => {
    return role === 'manager' || role === 'admin';
};