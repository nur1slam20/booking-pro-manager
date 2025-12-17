function Profile({ user }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Профиль</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Имя</label>
          <p className="text-lg">{user.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <p className="text-lg">{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Роль</label>
          <p className="text-lg capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;


