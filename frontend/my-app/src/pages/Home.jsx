import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CategoriesSection from '../components/CategoriesSection';
import FeaturedTextbooksSection from '../components/FeaturedTextbooksSection';
import ProcessSection from '../components/ProcessSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <main className="flex-grow">
      <HeroSection />
      <CategoriesSection />
      <FeaturedTextbooksSection />
      <ProcessSection />
    </main>
  );
};

export default Home;