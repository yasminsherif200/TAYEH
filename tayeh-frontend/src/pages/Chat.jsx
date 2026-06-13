import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

function Chat() {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px', paddingBottom: '80px' }}>
        <p>Chat Page</p>
      </main>
      <BottomNav />
    </div>
  )
}

export default Chat