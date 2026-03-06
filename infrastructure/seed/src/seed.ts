import { ChatSeed } from "./chat/chat.seed";
import { EventSeed } from "./events/event.seed";
import { InteractionSeed } from "./interactions/interaction.seed";
import { PaymentSeed } from "./payments/payment.seed";
import { UserSeed } from "./users/user.seed";
export interface DataProvider<T=void> {
  populate: () => Promise<T>;
}

async function seed() {
  const { users } = await new UserSeed().populate();
  console.log("Users list:\n", JSON.stringify(users, null, 2));
  
  const { events } = await new EventSeed(users).populate();

  console.log("Events list:\n", JSON.stringify(events, null, 2));

  const { interactions } = await new InteractionSeed(users, events).populate();
  
  console.log("Interactions list:\n", JSON.stringify(interactions, null, 2));

  const { chat } = await new ChatSeed(users).populate();
  
  console.log("Chat list:\n", JSON.stringify(chat, null, 2));

  const { payments } = await new PaymentSeed(users, events).populate();
  
  console.log("Payments list:\n", JSON.stringify(payments, null, 2));
}

seed();
