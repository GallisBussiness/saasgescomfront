import { Typewriter } from 'react-simple-typewriter'

function SectionTitle({title}:{title:string}) {
  return (
    <>
    
    <h2 className="sm:text-2xl text-xl font-bold mb-6">
    <Typewriter
            words={title.split(' ')}
            loop={5}
            cursor
            cursorStyle='|'
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
    </h2>
    {/* <p className="sm:text-lg text-base text-center text-gray-200">Embark on unforgettable journeys. Book your dream vacation today!</p> */}
    </>
  )
}

export default SectionTitle