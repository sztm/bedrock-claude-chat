import type { Story, StoryDefault } from '@ladle/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ChatListDrawer from './Drawer';
import { ConversationMeta } from '../@types/conversation';

const conversations: ConversationMeta[] = [
  {
    id: '1',
    title: 'What is RAG?',
    createTime: new Date().getTime(),
    lastMessageId: '',
    model: 'claude-v3.5-sonnet',
    botId: '1',
  },
];

export default {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Story />} />
          <Route path="/bot/:botId" element={<Story />} />
          <Route path="/bot/explore" element={<Story />} />
          <Route path="/:conversationId" element={<Story />} />
          <Route path="/admin/shared-bot-analytics" element={<Story />} />
          <Route path="/admin/api-management" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
} satisfies StoryDefault;

export const Admin: Story = () => {
  return (
    <ChatListDrawer
      isAdmin={true}
      conversations={conversations}
      updateConversationTitle={async () => {}}
      onSignOut={() => {}}
      onDeleteConversation={() => {}}
      onClearConversations={() => {}}
      onSelectLanguage={() => {}}
      onClickDrawerOptions={() => {}}
    />
  );
};

export const NonAdmin: Story = () => {
  return (
    <ChatListDrawer
      isAdmin={false}
      conversations={conversations}
      updateConversationTitle={async () => {}}
      onSignOut={() => {}}
      onDeleteConversation={() => {}}
      onClearConversations={() => {}}
      onSelectLanguage={() => {}}
      onClickDrawerOptions={() => {}}
    />
  );
};
