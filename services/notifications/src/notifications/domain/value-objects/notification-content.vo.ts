export interface NotificationContentProps {
    title: string;
    message: string;
}

export class NotificationContent {
    private constructor(
        private readonly title: string,
        private readonly message: string,
    ) {
        this.validate();
    }
    
    static create(props: NotificationContentProps): NotificationContent {
        return new NotificationContent(props.title, props.message);
    }

    private validate(): void {
        if (!this.title || this.title.trim() === "") {
            throw new Error("Title cannot be empty");
        }
        if (!this.message || this.message.trim() === "") {
            throw new Error("Message cannot be empty");
        }
    }

    getTitle(): string {
        return this.title;
    }

    getMessage(): string {
        return this.message;
    }
    
    toJson(): object {
        return {
            title: this.title,
            message: this.message,
        };
    }
}