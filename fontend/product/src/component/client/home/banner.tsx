import { useEffect, useState, useRef, type CSSProperties } from "react";

interface Banner {
  _id: string;
  id: number;
  image: string;
  text: string;
  font?: string;
  createdAt?: string;
}

const BannerSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/banners");
        if (!res.ok) throw new Error("Failed to fetch banners");
        const data: Banner[] = await res.json();
        setBanners(data);
      } catch (err) {
        console.error("Không thể tải banner:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [banners.length]);

  const mainBanner = banners[currentIndex] || banners[0];

  const heroStyle: CSSProperties | undefined = mainBanner?.image
    ? {
        backgroundImage: `url(${mainBanner.image})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }
    : undefined;

  return (
    <>
      <div
        className="container-fluid py-5 mb-5 hero-header"
        style={heroStyle}
      >
        <div className="container py-5" style={{ minHeight: 420 }} />
        
        {/* Slider dots */}
        {banners.length > 1 && (
          <div className="mt-3 d-flex justify-content-center gap-2">
            {banners.map((b, index) => (
              <button
                key={b._id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`border-0 rounded-circle ${
                  index === currentIndex ? "bg-primary" : "bg-light"
                }`}
                style={{
                  width: 10,
                  height: 10,
                  opacity: index === currentIndex ? 1 : 0.6,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BannerSection;