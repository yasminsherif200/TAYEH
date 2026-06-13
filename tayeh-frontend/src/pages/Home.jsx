import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

function Home() {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px', paddingBottom: '80px' }}>
        <p>Home Page</p>
      </main>
      <BottomNav />
    </div>
  )
}

export default Home