import { AuthRepository } from '@/modules/auth/auth.repository';
import { UserStatusEnum } from '@prisma/client';

describe('AuthRepository - Integration Tests', () => {
    let authRepository: AuthRepository;

    beforeEach(() => {
        authRepository = new AuthRepository();
    });

    describe('findAccount', () => {
        it('should return correct account structure for existing email', async () => {
            // Act
            const account = await authRepository.findAccount({
                email: 'toango123zx+test@gmail.com'
            });

            // Assert - Basic structure
            expect(account).not.toBeNull();
            expect(account).toBeDefined();
            
            // Assert - Account fields
            expect(account).toHaveProperty('id');
            expect(account).toHaveProperty('userId');
            expect(account).toHaveProperty('password');
            expect(account).toHaveProperty('salt');
            expect(account).toHaveProperty('user');

            // Assert - User object exists
            const user = account?.user;
            expect(user).toBeDefined();
            expect(user?.id).toBeTruthy();
            expect(user?.email).toBe('toango123zx+test@gmail.com');
            expect(user?.name).toBeTruthy();

            // Assert - Nullable fields validation
            if (user?.bio !== null) {
                expect(typeof user?.bio).toBe('string');
            }

            if (user?.avatar !== null) {
                expect(user?.avatar).toMatch(/^https?:\/\//);
            }

            if (user?.address !== null) {
                expect(typeof user?.address).toBe('string');
            }

            // Assert - Boolean field
            expect(typeof user?.verify).toBe('boolean');

            // Assert - Enum validation
            expect(Object.values(UserStatusEnum)).toContain(user?.status);

            // Assert - Date fields
            expect(user?.createdAt).toBeInstanceOf(Date);
            expect(user?.updatedAt).toBeInstanceOf(Date);
            expect(user?.deletedAt).toBeNull();
        });

        it('should return account with valid field types', async () => {
            // Act
            const account = await authRepository.findAccount({
                email: 'toango123zx+test@gmail.com'
            });

            // Assert
            expect(account).not.toBeNull();
            
            if (account) {
                expect(typeof account.id).toBe('string');
                expect(typeof account.userId).toBe('string');
                expect(typeof account.password).toBe('string');
                expect(typeof account.salt).toBe('string');
                
                const user = account.user;
                if (user) {
                    expect(typeof user.id).toBe('string');
                    expect(typeof user.name).toBe('string');
                    expect(typeof user.email).toBe('string');
                    expect(typeof user.verify).toBe('boolean');
                    expect(typeof user.status).toBe('string');
                }
            }
        });

        it('should return null for non-existing email', async () => {
            // Act
            const account = await authRepository.findAccount({
                email: 'toango123zx+test11@gmail.com',
            });

            // Assert
            expect(account).toBeNull();
        });

        it('should handle multiple email queries', async () => {
            // Test multiple emails
            const emails = [
                'toango123zx+test@gmail.com',
                'toango123zx+test11@gmail.com',
            ];

            for (const email of emails) {
                const account = await authRepository.findAccount({ email });
                
                if (account) {
                    expect(account.user?.email).toBe(email);
                }
            }
        });
    });
});