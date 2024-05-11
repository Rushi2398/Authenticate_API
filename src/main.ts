import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Create users
        await prisma.user.createMany({
            data: [
                {
                    name: 'John Doe',
                    phoneNumber: '1234567890',
                    email: 'john@example.com',
                    password: 'password123',
                },
                {
                    name: 'Rushikesh Jalvi',
                    phoneNumber: '9876543210',
                    password: 'password456',
                },
                {
                    name: 'Kamlesh Agarwal',
                    phoneNumber: '1112223333',
                    password: 'password789',
                },
                {
                    name: 'Rohan More',
                    phoneNumber: '4445556666',
                    password: 'passwordabc',
                },
                {
                    name: 'Heramb Karpe',
                    phoneNumber: '7778889999',
                    password: 'passworddef',
                },
            ],
        });

        const users = await prisma.user.findMany();

        console.log('Users created:', users);

        // Create contacts
        const contacts = await Promise.all(
            users.map((user, index) =>
                prisma.contact.createMany({
                    data: [
                        {
                            name: `Contact ${index + 1}`,
                            phoneNumber: `993456789${index}`,
                            userId: user.id,
                        },
                    ],
                })
            )
        );

        console.log('Contacts created:', contacts);


        // Mark numbers as spam
        await prisma.spam.createMany({
            data: [
                {
                    phoneNumber: '3344556677',
                    likelihood: 0.8,
                    userId: users[1].id, // Jane Smith
                },
                {
                    phoneNumber: '9988776655',
                    likelihood: 0.6,
                    userId: users[0].id, // John Doe
                },
                {
                    phoneNumber: '1122334455',
                    likelihood: 0.5,
                    userId: users[2].id, // Emily Brown
                },
                {
                    phoneNumber: '5566778899',
                    likelihood: 0.7,
                    userId: users[4].id, // Sophia Williams
                },
                {
                    phoneNumber: '7788990011',
                    likelihood: 0.4,
                    userId: users[3].id, // Michael Johnson
                },
            ],
        });

        console.log('Spam records created successfully!');
    } catch (error) {
        console.error('Error populating sample data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
