
import { RouterProvider } from 'react-router-dom'
import { browserRouter } from '../router.jsx'

function App() {

  return (
    <RouterProvider router={browserRouter} />
  )
}

export default App
