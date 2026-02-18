import { useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CountdownTimer from "@/components/CountdownTimer";
import JoiningForm from "@/components/JoiningForm";
import ParticipantsList from "@/components/ParticipantsList";
import PhotoWall from "@/components/PhotoWall";
import CommitteeSection from "@/components/CommitteeSection";
import Footer from "@/components/Footer";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection onJoinClick={scrollToForm} />
      <CountdownTimer />
      <JoiningForm formRef={formRef} />
      <ParticipantsList />
      <PhotoWall />
      <CommitteeSection />
      <Footer />
      <Footer />
    </div>
  );
};

export default Index;
