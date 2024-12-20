import React from 'react';
import { Link } from 'react-router-dom';
import { FaWrench, FaMapMarkedAlt, FaVideo, FaComments } from 'react-icons/fa';

const Feature = ({ icon, title, description }) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
    {icon}
    <h3 className="mt-4 text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-gray-600 text-center">{description}</p>
  </div>
);

const Testimonial = ({ name, feedback, avatar }) => (
  <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
    <img
      src={avatar}
      alt={`${name}'s avatar`}
      className="w-16 h-16 rounded-full mb-4"
    />
    <h4 className="text-lg font-semibold">{name}</h4>
    <p className="mt-2 text-gray-600 text-center">{feedback}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">FixNgo</h1>
          <nav>
            <Link to="/signup" className="mr-4 text-white hover:text-gray-300">
              Sign up as User
            </Link>
            <Link to="/workshop/signup" className="text-white hover:text-gray-300">
              Sign up as Workshop
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto mt-12 px-4">
        <section className="text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            Your Roadside Assistance Solution
          </h2>
          <p className="text-xl text-black mb-8">
            Connect with nearby workshops instantly when you need help on the road.
          </p>
          <Link
            to="/signup"
            className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition duration-300"
          >
            Get Started
          </Link>
        </section>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Feature
            icon={<FaWrench className="text-5xl text-black" />}
            title="Connect with Workshops"
            description="Find and connect with nearby workshops quickly and easily."
          />
          <Feature
            icon={<FaMapMarkedAlt className="text-5xl text-black" />}
            title="Live Tracking"
            description="Track the location of your assigned workshop in real-time."
          />
          <Feature
            icon={<FaVideo className="text-5xl text-black" />}
            title="Video Calls"
            description="Get expert advice through video calls with mechanics."
          />
          <Feature
            icon={<FaComments className="text-5xl text-black" />}
            title="Instant Chat"
            description="Communicate easily with workshops through our chat feature."
          />
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2 text-black">1. Request Service</h3>
              <p className="text-black">Send a service request with your location and issue details.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2 text-black">2. Get Connected</h3>
              <p className="text-black">Nearby workshops receive your request and can accept it.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2 text-black">3. Receive Assistance</h3>
              <p className="text-black">Track, communicate, and get the help you need on the road.</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center text-black mb-8">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Testimonial
              name="John Doe"
              feedback="FixNgo saved my day when I had a flat tire in the middle of nowhere. The workshop arrived in 15 minutes!"
              avatar="https://via.placeholder.com/150"
            />
            <Testimonial
              name="Jane Smith"
              feedback="Great experience! The chat feature made it easy to explain my car issue, and the mechanic was very professional."
              avatar="https://via.placeholder.com/150"
            />
            <Testimonial
              name="Sam Wilson"
              feedback="The live tracking feature is amazing. I could see exactly where my assigned workshop was."
              avatar="https://via.placeholder.com/150"
            />
          </div>
        </section>
      </main>

      <footer className="bg-black text-white mt-16 py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 FixNgo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
