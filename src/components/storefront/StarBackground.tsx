import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export function StarBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // Stars loaded
  };

  const options: ISourceOptions = {
    background: {
      color: {
        value: "transparent", // Use the site's blue from styles.css
      },
    },
    fullScreen: {
      enable: true,
      zIndex: -1,
    },
    fpsLimit: 120,
    particles: {
      color: {
        value: ["#ffffff", "#FFD700"], // White and Gold stars
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "out" },
        random: true,
        speed: 0.3, // Slow drifting stars
        straight: false,
      },
      number: {
        density: { enable: true, width: 800, height: 800 },
        value: 160, // Number of stars
      },
      opacity: {
        value: { min: 0.8, max: 1 },
        animation: {
          enable: true,
          speed: 1,
          sync: false, // Makes stars twinkle independently
        },
      },
      shape: { type: "circle" },
      size: {
        value: { min: 1, max: 2 },
      },
    },
    detectRetina: true,
  };

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return null;
}
