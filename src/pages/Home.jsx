import React from 'react';
import { Box } from '@mui/material';
import '../components/layout/Header.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import img1 from '../assets/images/1.png';
import img2 from '../assets/images/2.png';


const images = [img1, img2];

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Box
      sx={{
        p: 0,
        m: 0,
        marginTop: '52px',
        width: '100%',
        maxWidth: '1200px',
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Slider {...settings}>
        {images.map((src, idx) => (
          <div key={idx}>
            <img
              src={src}
              alt={`slide-${idx}`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 12,
                display: "block"
              }}
            />
          </div>
        ))}
      </Slider>
    </Box>
  );
};

export default Home;
