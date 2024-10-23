import { Link } from "react-router-dom"
import generateUniqueId from "../utils/generateUniqueRoomID"

const cardList = [
    { title: "Whiteboard", icon: "🖼️", link: '/whiteboard' },
    { title: "Chat", icon: "💬" },
    { title: "Video Call", icon: "🎥" },
    { title: "File Sharing", icon: "📁" },
    { title: "Task Management", icon: "✅" },
    { title: "Calendar", icon: "📅" },
    { title: "Notes", icon: "📝" },
    { title: "Polls", icon: "📊" },
    { title: "And More!", icon: "🚀" },
]


const Homepage = () => {

    const cardChip = (title: string, icon: string, index: number) => {
        return (
            <Link key={index} to={title === 'Whiteboard' ? `/whiteboard/${generateUniqueId()}` : title.replace(" ", "").toLowerCase()} className="bg-white border p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 hover:scale-105 transform flex flex-col items-center justify-center">
                <div className="text-4xl">{icon}</div>
                <h3 className="text-lg font-semibold mt-3 text-gray-700">{title}</h3>
            </Link>
        )
    }

    return (
        <div className="container mx-auto px-4 text-center">
            <header className="py-10 text-black">
                <h1 className="text-4xl font-extrabold drop-shadow-lg">
                    Welcome to Collaboration Tool!
                </h1>
                <p className="text-lg mt-4 font-semibold max-w-xl mx-auto drop-shadow-lg">
                    Experience a wide range of features designed to boost teamwork and productivity.
                </p>
            </header>

            {/* Features Section */}
            <section className="py-12">
                <h2 className="text-3xl font-semibold text-black drop-shadow-lg mb-8">What We Offer</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {cardList.map((feature, index) => cardChip(feature.title, feature.icon, index))}
                </div>
            </section>
        </div>
    )
}

export default Homepage
