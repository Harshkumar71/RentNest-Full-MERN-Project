import dotenv from "dotenv";
import mongoose from "mongoose";
import Property from "./models/Property.js";

dotenv.config();

// Replace this with your actual owner account _id
const OWNER_ID = "6af5efc6ad6ad3d004bee346";

const cities = [
  ["Jaipur", "Rajasthan", 26.9124, 75.7873],
  ["Udaipur", "Rajasthan", 24.5854, 73.7125],
  ["Jodhpur", "Rajasthan", 26.2389, 73.0243],
  ["Delhi", "Delhi", 28.6139, 77.2090],
  ["Mumbai", "Maharashtra", 19.0760, 72.8777],
  ["Pune", "Maharashtra", 18.5204, 73.8567],
  ["Goa", "Goa", 15.2993, 74.1240],
  ["Bengaluru", "Karnataka", 12.9716, 77.5946],
  ["Hyderabad", "Telangana", 17.3850, 78.4867],
  ["Manali", "Himachal Pradesh", 32.2432, 77.1892],
  ["Shimla", "Himachal Pradesh", 31.1048, 77.1734],
  ["Rishikesh", "Uttarakhand", 30.0869, 78.2676],
  ["Kolkata", "West Bengal", 22.5726, 88.3639],
  ["Chennai", "Tamil Nadu", 13.0827, 80.2707],
  ["Agra", "Uttar Pradesh", 27.1767, 78.0081],
  ["Varanasi", "Uttar Pradesh", 25.3176, 82.9739],
  ["Amritsar", "Punjab", 31.6340, 74.8723],
  ["Kochi", "Kerala", 9.9312, 76.2673],
  ["Mysuru", "Karnataka", 12.2958, 76.6394],
  ["Darjeeling", "West Bengal", 27.0410, 88.2663]
];

const types = ["Apartment", "House", "Villa", "Room", "Farmhouse"];

const amenitiesList = [
  "WiFi", "Swimming Pool", "Parking", "Air Conditioning",
  "Kitchen", "TV", "Garden", "Balcony", "Gym",
  "Washing Machine", "Pet Friendly", "Security"
];

const imageUrls = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea"
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const properties = Array.from({ length: 500 }, (_, i) => {
  const city = cities[i % cities.length];
  const type = pick(types);

  const amenities = [...amenitiesList]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4 + Math.floor(Math.random() * 5));

  return {
    owner: new mongoose.Types.ObjectId(OWNER_ID),
    title: `${type} ${city[0]} Stay ${i + 1}`,
    description: `Enjoy a comfortable ${type.toLowerCase()} in ${city[0]}, ${city[1]}. This property offers convenient facilities, a welcoming atmosphere and a relaxing stay.`,
    type,
    pricePerNight: Math.floor(Math.random() * 9000) + 1000,
    location: {
      address: `${100 + i} Sample Street, ${city[0]}`,
      city: city[0],
      state: city[1],
      country: "India",
      lat: city[2] + (Math.random() - 0.5) * 0.05,
      lng: city[3] + (Math.random() - 0.5) * 0.05
    },
    bedrooms: Math.floor(Math.random() * 4) + 1,
    bathrooms: Math.floor(Math.random() * 3) + 1,
    maxGuests: Math.floor(Math.random() * 7) + 1,
    amenities,
    images: [pick(imageUrls) + "?auto=format&fit=crop&w=1200&q=80"],
    averageRating: Number((3 + Math.random() * 2).toFixed(1)),
    ratingCount: Math.floor(Math.random() * 100),
    isActive: true
  };
});

async function seedProperties() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from server/.env");
    }

    if (!mongoose.isValidObjectId(OWNER_ID) ||
        OWNER_ID === "6af5efc6ad6ad3d004bee346") {
      throw new Error("Please enter a valid existing owner ObjectId.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    await Property.insertMany(properties);

    console.log("Successfully inserted 500 sample properties!");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedProperties();