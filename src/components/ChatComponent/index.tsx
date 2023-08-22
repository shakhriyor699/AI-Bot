import React, { useState } from 'react';
import userAvatar from '../../assets/userAvatar.png';
import botAvatar from '../../assets/botAvatar.png';
import sendIcon from '../../assets/sendIcon.svg';
import styles from './ChatComponent.module.scss';


interface Message {
  id: number;
  sender: string;
  text: string;
}

interface BotMessage {
  status: 'string',
  value: string
}

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  console.log(botMessages);


  async function sendMessage(message: string) {
    const response = await fetch('http://185.46.8.130/api/v1/chat/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });


    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    if (response.body === null) {
      throw new Error('Response body is empty');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partialResponse = '';
    let isDone = false;

    const processResponseChunk = async () => {
      try {

        while (!isDone) {

          const { done, value } = await reader.read();

          if (done) {
            isDone = true;
            break;
          }

          const chunk = decoder.decode(value);
          partialResponse += chunk;
          const responseArray: BotMessage[] = [];

          const chunks = partialResponse.match(/({[^}]+})/g);

          if (chunks) {
            chunks.forEach((chunk) => {
              try {
                const parsedChunk = JSON.parse(chunk);
                responseArray.push(parsedChunk);
              } catch (error) {
                console.error(`Error parsing JSON: ${chunk}`, error);
              }
            });
          }



          try {
            responseArray.forEach(async (response) => {
              const { status, value: chunkValue } = response
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (status === "content" && chunkValue !== null) {
                // await new Promise(resolve => setTimeout(resolve, 100));
                const botMessage: Message = { id: Date.now(), sender: 'Bot', text: chunkValue };
                setBotMessages(prevBotMessages => [...prevBotMessages, botMessage]);


                setIsBotTyping(false);
              }
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (status === 'done') {
                setIsBotTyping(false);
                // setBotMessages([])
              }
            })
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    processResponseChunk();
  }

  const handleSendMessage = async () => {
    if (inputValue !== '') {
      const userMessage: Message = { id: Date.now(), sender: 'User', text: inputValue };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      try {
        setIsBotTyping(true);
        await sendMessage(inputValue);
      } catch (error) {
        console.error(error);
      }
      setInputValue('');
    }
  };


  return (
    <>
      <div className={styles.chatContainer}>
        {messages.map((message, i) => (
          <div key={i} className={styles.messageContainer}>
            <div className={`${styles.message} ${styles.userMessage}`}>
              <div className={styles.messageText}>{message.text}</div>
            </div>
            <div className={styles.avatar}>
              <img src={userAvatar} alt="Avatar" />
            </div>
          </div>
        ))}
        {botMessages.length > 0 && (
          <div className={styles.messageContainer}>
            <div className={styles.avatar}>
              <img src={botAvatar} alt='Avatar' />
            </div>
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.messageText}>
                {botMessages.map((botMessage) => (
                  <span>{botMessage.text}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {isBotTyping && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.avatar}>
              <img src="avatar.png" alt='Avatar' />
            </div>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)} />
      <button type="button" onClick={handleSendMessage}><img src={sendIcon} alt="" /></button>
      </div>
    </>
  )
};


export default ChatComponent