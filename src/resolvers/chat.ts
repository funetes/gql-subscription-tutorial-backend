import {
  Arg,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Chat } from "../entities/chat";

const chats: Chat[] = [];
const channel: string = "CHAT_CHANNEL";

@Resolver()
export class ChatResolver {
  @Query(() => [Chat])
  getChats(): Chat[] {
    return chats;
  }

  @Mutation(() => Chat)
  async createChat(
    @PubSub() PubSub: PubSubEngine,
    @Arg("name") name: string,
    @Arg("message") message: string
  ): Promise<Chat> {
    const chat = { id: chats.length + 1, name, message };
    chats.push(chat);
    const payload = chat;
    // 얘가 call되면 아마 subscription 함수가 call 되는듯
    // 이 채널을 구독하고 있는 구독자들 모두에게 data(payload)를 쏴준다.
    await PubSub.publish(channel, payload);
    return chat;
  }

  @Subscription({ topics: channel })
  messageSent(@Root() { id, name, message }: Chat): Chat {
    return { id, name, message };
  }
}
