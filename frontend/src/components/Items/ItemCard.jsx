import { useNavigate } from 'react-router-dom';

export const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
      onClick={() => navigate(`/item/${item._id}`)}
    >
      {item.images && item.images.length > 0 && (
        <img
          src={item.images[0]}
          alt={item.name}
          className="w-full h-40 object-cover bg-gray-200"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
        <p className="text-xs text-gray-500 mb-3">{item.location?.address}</p>
        <div className="flex justify-between items-center">
          <span className="text-yellow-500">⭐ {item.rating || 5}</span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            {item.status}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Owner: {item.owner?.name} (Trust: {item.owner?.trustScore})
        </p>
      </div>
    </div>
  );
};
