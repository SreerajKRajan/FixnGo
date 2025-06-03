import React from "react";
import {
  FaWrench,
  FaMapMarkedAlt,
  FaComments,
  FaShieldAlt,
  FaUsers,
  FaCar,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Card = ({ children, className = "", hover = true }) => (
  <div
    className={`bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 transition-all duration-300 ${
      hover ? "hover:border-black hover:shadow-xl hover:-translate-y-1" : ""
    } ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  to,
  href,
  onClick,
  ...props
}) => {
  const baseClasses =
    "rounded-lg font-semibold transition-all duration-300 flex items-center justify-center";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary:
      "bg-white text-black border-2 border-black hover:bg-black hover:text-white",
    outline:
      "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  // If 'to' prop is provided, render as Link
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  // If 'href' prop is provided, render as anchor
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  // Default to button
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Card className="group text-center">
    <div className="text-3xl md:text-4xl text-black mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-lg md:text-xl font-bold text-black mb-3 md:mb-4">
      {title}
    </h3>
    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
      {description}
    </p>
  </Card>
);

const TargetCard = ({
  icon,
  title,
  subtitle,
  features,
  ctaText,
  isWorkshop = false,
  ctaLink,
}) => (
  <div
    className={`relative overflow-hidden rounded-lg border-2 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
      isWorkshop
        ? "bg-black text-white border-black hover:bg-gray-900"
        : "bg-white text-black border-gray-200 hover:border-black"
    }`}
  >
    <div className="text-4xl md:text-5xl mb-4 md:mb-6">{icon}</div>
    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">{title}</h3>
    <p
      className={`text-base md:text-lg mb-4 md:mb-6 ${
        isWorkshop ? "text-gray-300" : "text-gray-600"
      }`}
    >
      {subtitle}
    </p>
    <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <FaCheckCircle
            className={`mr-3 mt-1 flex-shrink-0 text-sm ${
              isWorkshop ? "text-white" : "text-black"
            }`}
          />
          <span
            className={`text-sm ${
              isWorkshop ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {feature}
          </span>
        </li>
      ))}
    </ul>
    <Button
      variant={isWorkshop ? "secondary" : "primary"}
      className="w-full sm:w-auto"
      to={ctaLink}
    >
      {ctaText}
      <FaArrowRight className="ml-2" />
    </Button>
  </div>
);

const ProcessStep = ({ number, title, description, isUser = true }) => (
  <div className="flex items-start space-x-3 md:space-x-4">
    <div
      className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-base ${
        isUser ? "bg-black" : "bg-gray-700"
      }`}
    >
      {number}
    </div>
    <div className="flex-1">
      <h4 className="text-base md:text-lg font-semibold text-black mb-1 md:mb-2">
        {title}
      </h4>
      <p className="text-gray-600 text-sm md:text-base">{description}</p>
    </div>
  </div>
);

const WhyChooseCard = ({ icon, title, description }) => (
  <Card className="text-center">
    <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto">
      {React.cloneElement(icon, {
        className: "text-white text-lg md:text-2xl",
      })}
    </div>
    <h3 className="text-base md:text-lg font-semibold text-black mb-2">
      {title}
    </h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </Card>
);

const Section = ({ children, className = "", bg = "white" }) => {
  const bgClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    black: "bg-black",
  };

  return (
    <section
      className={`py-12 md:py-20 px-4 md:px-6 ${bgClasses[bg]} ${className}`}
    >
      <div className="container mx-auto max-w-7xl">{children}</div>
    </section>
  );
};

const LandingPage = () => {
  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Verified Workshop Listings",
      description:
        "Only admin-approved workshops join our network, ensuring quality and reliability.",
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Location-based Matching",
      description:
        "Smart matching algorithm connects you with the nearest available workshops.",
    },
    {
      icon: <FaComments />,
      title: "Real-time Chat",
      description:
        "Instant messaging between users and workshops for seamless communication.",
    },
    {
      icon: <FaUsers />,
      title: "Easy OTP Signup",
      description:
        "Quick and secure registration process with SMS verification.",
    },
  ];

  const whyChooseData = [
    {
      icon: <FaArrowRight />,
      title: "Fastest Response",
      description: "Get help on the road in minutes, not hours",
    },
    {
      icon: <FaShieldAlt />,
      title: "Verified Partners",
      description: "Only trusted workshops onboarded",
    },
    {
      icon: <FaComments />,
      title: "Direct Communication",
      description: "Seamless real-time chat features",
    },
    {
      icon: <FaWrench />,
      title: "Modern Technology",
      description: "Built with secure, cutting-edge tech",
    },
  ];

  const userSteps = [
    {
      title: "Sign up & share your location",
      description:
        "Quick registration with OTP verification and location access for accurate service matching.",
    },
    {
      title: "Send a service request",
      description:
        "Describe your issue and let nearby workshops know you need assistance.",
    },
    {
      title: "Chat with assigned workshop",
      description:
        "Communicate directly with the workshop through our real-time chat feature.",
    },
  ];

  const workshopSteps = [
    {
      title: "Register & upload verification",
      description:
        "Sign up with your workshop details and submit required verification documents.",
    },
    {
      title: "Get approved by admin",
      description:
        "Our team reviews your application to ensure quality standards are met.",
    },
    {
      title: "Receive service requests",
      description:
        "Start receiving real-time service requests from users in your area.",
    },
  ];

  const footerLinks = {
    "For Users": ["User Signup", "How It Works", "Support"],
    "For Workshops": ["Workshop Signup", "Verification Process", "Guidelines"],
    Legal: ["Terms & Conditions", "Privacy Policy", "Contact Us"],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaWrench className="text-xl md:text-2xl text-white" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                FixNgo
              </h1>
            </div>
            <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4">
              <Button
                variant="outline"
                size="sm"
                to="/signup"
                className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2"
              >
                Sign up as User
              </Button>
              <Button
                variant="secondary"
                size="sm"
                to="/workshop/signup"
                className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2"
              >
                Sign up as Workshop
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Section bg="gray">
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6 leading-tight">
              FixNgo connects vehicle owners with
              <span className="block sm:inline"> trusted nearby workshops</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-4">
              Whether you need urgent help on the road or want to offer your
              repair services, FixNgo is your all-in-one platform — fast,
              reliable, and hassle-free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="shadow-lg hover:shadow-xl"
                to="/signup"
              >
                Sign up as User
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="shadow-lg hover:shadow-xl"
                to="/workshop/signup"
              >
                Sign up as Workshop
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Who is FixNgo For */}
      <Section>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12 md:mb-16">
          Who is FixNgo For?
        </h2>
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          <TargetCard
            icon={<FaCar />}
            title="For Users"
            subtitle="Request nearby roadside assistance in seconds"
            features={[
              "Instant connection to verified workshops",
              "Real-time location sharing",
              "Direct chat with mechanics",
              "Quick OTP-based signup",
            ]}
            ctaText="Get Help Now"
            ctaLink="/signup"
          />
          <TargetCard
            icon={<FaWrench />}
            title="For Workshops"
            subtitle="Get discovered by customers nearby & grow your business"
            features={[
              "Receive real-time service requests",
              "Admin-verified listings",
              "Direct customer communication",
              "Expand your customer base",
            ]}
            ctaText="Join Network"
            ctaLink="/workshop/signup"
            isWorkshop={true}
          />
        </div>
      </Section>

      {/* Key Features */}
      <Section bg="gray">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-3 md:mb-4">
          Key Features
        </h2>
        <p className="text-center text-gray-600 mb-12 md:mb-16 text-base md:text-lg">
          Built with only the features that matter most
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12 md:mb-16">
          How It Works
        </h2>
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 max-w-6xl mx-auto">
          {/* For Users */}
          <Card className="hover:border-black">
            <h3 className="text-xl md:text-2xl font-bold text-black mb-6 md:mb-8 text-center">
              For Users
            </h3>
            <div className="space-y-6 md:space-y-8">
              {userSteps.map((step, index) => (
                <ProcessStep
                  key={index}
                  number={index + 1}
                  title={step.title}
                  description={step.description}
                  isUser={true}
                />
              ))}
            </div>
          </Card>

          {/* For Workshops */}
          <div className="bg-black text-white rounded-lg p-6 md:p-8 hover:bg-gray-900 transition-all duration-300">
            <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center">
              For Workshops
            </h3>
            <div className="space-y-6 md:space-y-8">
              {workshopSteps.map((step, index) => (
                <ProcessStep
                  key={index}
                  number={index + 1}
                  title={step.title}
                  description={step.description}
                  isUser={false}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Why Choose FixNgo */}
      <Section bg="gray">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 md:mb-12 text-center">
          Why Choose FixNgo?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {whyChooseData.map((item, index) => (
            <WhyChooseCard key={index} {...item} />
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section bg="black" className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
          Join hundreds of users and workshops already using FixNgo
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-10">
          Get started today and experience the future of roadside assistance
        </p>
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-black hover:bg-gray-100 shadow-lg"
            to="/signup"
          >
            Sign up as User
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="shadow-lg"
            to="/workshop/signup"
          >
            Sign up as Workshop
          </Button>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <FaWrench className="text-xl md:text-2xl text-white" />
                <h3 className="text-lg md:text-xl font-bold text-white">
                  FixNgo
                </h3>
              </div>
              <p className="text-gray-400 text-sm md:text-base">
                Connecting vehicle owners with trusted workshops across the
                region.
              </p>
            </div>
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">
                  {title}
                </h4>
                <ul className="space-y-1 md:space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
            <p className="text-gray-400 text-sm md:text-base">
              &copy; 2025 FixNgo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;