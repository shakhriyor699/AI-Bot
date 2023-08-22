import ChatComponent from "./components/ChatComponent"
import styles from './App.module.scss'


function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bot Chat</h1>
      <h3 className={styles.subtitle}>AI-based service</h3>
      <ChatComponent />
    </div>
  )
}

export default App
