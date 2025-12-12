// Mock data
let textbooks = [
    {
        id: 1,
        title: "Lập trình Web nâng cao",
        author: "Nguyễn Văn A",
        authorId: 101,
        status: "APPROVED",
        subject: "CNTT",
        description: "Giáo trình chuyên sâu về React và Node.js",
        fileUrl: "#",
        updatedAt: "2024-01-15"
    },
    {
        id: 2,
        title: "Cơ sở dữ liệu",
        author: "Trần Thị B",
        authorId: 102,
        status: "PENDING",
        subject: "CNTT",
        description: "Nhập môn SQL và NoSQL",
        fileUrl: "#",
        updatedAt: "2024-02-20"
    },
    {
        id: 3,
        title: "Toán rời rạc",
        author: "Lê Văn C",
        authorId: 101, // Same author as #1
        status: "DRAFT",
        subject: "Toán",
        description: "Lý thuyết đồ thị và logic",
        fileUrl: "#",
        updatedAt: "2024-03-10"
    }
];

export const TextbookService = {
    getAll: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...textbooks]), 500);
        });
    },

    getById: async (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const book = textbooks.find(t => t.id === parseInt(id));
                if (book) resolve(book);
                else reject(new Error("Textbook not found"));
            }, 300);
        });
    },

    getMyTextbooks: async (userId) => {
        // In a real app, userId would come from token/context. 
        // Here we mock it. Let's assume current user is ID 101.
        const currentUserId = 101;
        return new Promise((resolve) => {
            setTimeout(() => {
                const myBooks = textbooks.filter(t => t.authorId === currentUserId);
                resolve(myBooks);
            }, 500);
        });
    },

    create: async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newBook = {
                    id: textbooks.length + 1,
                    ...data,
                    authorId: 101, // Mock current user
                    status: "DRAFT",
                    updatedAt: new Date().toISOString().split('T')[0]
                };
                textbooks.push(newBook);
                resolve(newBook);
            }, 800);
        });
    },

    update: async (id, data) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = textbooks.findIndex(t => t.id === parseInt(id));
                if (index !== -1) {
                    textbooks[index] = { ...textbooks[index], ...data };
                    resolve(textbooks[index]);
                } else {
                    reject(new Error("Textbook not found"));
                }
            }, 500);
        });
    },

    submitForReview: async (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = textbooks.findIndex(t => t.id === parseInt(id));
                if (index !== -1) {
                    textbooks[index].status = "PENDING";
                    resolve(textbooks[index]);
                } else {
                    reject(new Error("Textbook not found"));
                }
            }, 500);
        });
    },

    approve: async (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = textbooks.findIndex(t => t.id === parseInt(id));
                if (index !== -1) {
                    textbooks[index].status = "APPROVED";
                    resolve(textbooks[index]);
                } else {
                    reject(new Error("Textbook not found"));
                }
            }, 500);
        });
    },

    reject: async (id, comment) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = textbooks.findIndex(t => t.id === parseInt(id));
                if (index !== -1) {
                    textbooks[index].status = "REJECTED";
                    textbooks[index].rejectionReason = comment;
                    resolve(textbooks[index]);
                } else {
                    reject(new Error("Textbook not found"));
                }
            }, 500);
        });
    }
};
