import { Container } from "@/components/container";
import Marquee from "react-fast-marquee";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { MarqueImg } from "@/components/marquee-img";

const HomePage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container>
        {/* Header Text */}
        <div className="my-8">
          <h2 className="text-3xl text-center md:text-left md:text-6xl">
            <span className="text-outline font-extrabold md:text-8xl">
              Interviewly
            </span>
            <br />
            Practice your interview with our friendly neighbourhood AI
          </h2>
        </div>

        {/* Stats Section */}
        <div className="flex w-full items-center justify-evenly md:px-12 md:py-16 md:items-center md:justify-end gap-12">
          <p className="text-3xl font-semibold text-gray-900 text-center">
            250k+
            <span className="block text-xl text-muted-foreground font-normal">
              Offers Received
            </span>
          </p>
          <p className="text-3xl font-semibold text-gray-900 text-center">
            1.2M+
            <span className="block text-xl text-muted-foreground font-normal">
              Interviews Aced
            </span>
          </p>
        </div>

        {/* Image Section with smaller max width */}
        <div className="w-full mt-4 rounded-xl bg-gray-100 h-[420px] drop-shadow-md overflow-hidden relative">
          <img
            src="/assets/img/ai.webp"
            alt="AI Interview Assistant"
            className="w-full h-full object-cover"
          />

          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30" />

          {/* Top-left Badge */}
          <div className="absolute top-4 left-4 px-4 py-2 rounded-md bg-white/40 backdrop-blur-md shadow-md text-sm font-medium">
            Interviews Copilot&copy;
          </div>

{/* Developer Card */}
<div className="hidden md:block absolute bottom-4 right-4 max-w-sm p-6 rounded-2xl bg-white/80 backdrop-blur-md shadow-2xl border border-gray-200">
  <h2 className="text-xl font-bold text-neutral-800 mb-2 flex items-center gap-2">
    <Sparkles className="text-yellow-500 w-5 h-5" />
    AI Developer Copilot
  </h2>
  <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
    Transform the way you prepare. Gain confidence and boost your chances of landing your dream job with smart, AI-powered interview practice.
  </p>
  <Link to="/generate" className="block w-full">
    <Button className="w-full font-semibold hover:brightness-105 transition duration-200">
      Generate Now <Sparkles className="ml-2 w-4 h-4" />
    </Button>
  </Link>
</div>

        </div>
      </Container>

      {/** marq section */}
      <div className="w-full my-12">
        <Marquee pauseOnHover>
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/zoom.png" />
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/tailwindcss.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />

        </Marquee>
      </div>
      <Container className="py-8 space-y-8">
        <h2 className="tracking-wide text-xl text-gray-800 font-semibold">
          Unleash your potential with personalized AI insights and targeted
          interview practice.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="col-span-1 md:col-span-3">
            <img
              src="/assets/img/office.jpg"
              alt=""
              className="w-full max-h-96 rounded-md object-cover"
            />
          </div>

          <div className="col-span-1 md:col-span-2 gap-8 max-h-96 min-h-96 w-full flex flex-col items-center justify-center text-center">
            <p className="text-center text-muted-foreground">
              Transform the way you prepare, gain confidence, and boost your
              chances of landing your dream job. Let AI be your edge in
              today&apos;s competitive job market.
            </p>

            <Link to={"/generate"} className="w-full">
              <Button className="w-3/4">
                Generate <Sparkles className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>

    </div>
  );
};

export default HomePage;
