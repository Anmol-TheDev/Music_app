import { useEffect, useState } from "react";
import { User, Mail, Check, AlertCircle } from "lucide-react";
import { auth } from "../../Auth/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [age, setAge] = useState("");
  const [Bio, setBio] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setEmail(u.email || "");
        setUsername(u.displayName || "");
        // load gender/age from localStorage (demo fallback since Firebase Auth doesn't store custom fields)
        try {
          const saved = JSON.parse(localStorage.getItem(`profile_${u.uid}`) || "{}");
          if (saved.gender) setGender(saved.gender);
          if (saved.age) setAge(saved.age);
          if (saved.Bio) setBio(saved.Bio);
        } catch (e) {
          console.log(e);
        }
      } else {
        setUser(null);
        setEmail("");
        setUsername("");
        setGender("prefer_not_to_say");
        setAge("");
        setBio("");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const startEdit = () => {
    setStatus({ type: "", message: "" });
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (user) {
      setEmail(user.email || "");
      setUsername(user.displayName || "");
      try {
        const saved = JSON.parse(localStorage.getItem(`profile_${user.uid}`) || "{}");
        setGender(saved.gender || "prefer_not_to_say");
        setAge(saved.age || "");
        setBio(saved.Bio || "");
      } catch (e) {
        setGender("prefer_not_to_say");
        setAge("");
        setBio("");
        console.log(e);
      }
    }
    setEditMode(false);
    setStatus({ type: "", message: "" });
  };

  const saveProfile = async () => {
    if (!user) return;
    setStatus({ type: "pending", message: "Saving..." });
    try {
      // update displayName in Firebase Auth
      if (username !== user.displayName) {
        await updateProfile(user, { displayName: username });
      }
      // persist gender and age locally (or replace with your DB call)
      const payload = { gender, age, Bio };
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(payload));

      // reflect changes in local state user
      setUser({ ...user, displayName: username });
      setEditMode(false);
      setStatus({ type: "success", message: "Profile saved." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to save profile." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-8">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-8">
        <div className="text-center text-gray-700">
          <User className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Not signed in</h2>
          <p className="text-sm text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className=" bg-gray-100 flex items-center justify-center p-8 shadow-lg  "
      style={{ background: " hsl(var(--background))" }}
    >
      <div className="w-full max-w-[500px] rounded-[18px]  mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src="https://img.icons8.com/?size=100&id=0fJNI0ujUVCz&format=png&color=FFFFFF"
              alt="User profile icon, red"
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-700">Profile</h2>
              <p className="text-sm text-gray-500">Manage your public info</p>
            </div>
          </div>
          {!editMode ? (
            <button
              onClick={startEdit}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700"
            >
              Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={saveProfile}
                className="bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Username (editable when in editMode) */}
          <label className="flex flex-col text-sm text-gray-600">
            <span className="flex items-center gap-2 mb-1">
              <User size={16} /> Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!editMode}
              className={`rounded-md px-3 py-2 ${editMode ? "bg-white border border-indigo-200" : "bg-gray-100 border border-gray-200"} text-gray-700`}
            />
          </label>

          {/* Email */}
          <label className="flex flex-col text-sm text-gray-600">
            <span className="flex items-center gap-2 mb-1">
              <Mail size={16} /> Email
            </span>
            <input
              type="email"
              value={email}
              readOnly
              className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-gray-700"
            />
          </label>

          <div className="flex items-center gap-6">
            {/* Gender (select) */}
            <label className="flex flex-col text-sm  text-gray-600">
              <span className="mb-1">Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!editMode}
                className={`rounded-md px-1 w-[214px] py-2  disabled:bg-white disabled:text-gray-700 disabled:opacity-100 text-gray-700 focus:outline-none  focus:ring-0 bg-white`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>

            {/* Age */}
            <label className="flex flex-col  text-sm text-gray-600">
              <span className="mb-1">Age</span>
              <input
                type="number"
                value={age > 0 && age <= 90 ? age : ""}
                onChange={(e) => setAge(e.target.value)}
                readOnly={!editMode}
                min="0"
                max="90"
                className={`rounded-md  px-1 w-[195px] py-2 ${editMode ? "bg-white border border-indigo-200" : "bg-gray-100 border border-gray-200"} text-gray-700`}
              />
            </label>
          </div>
          {/*Bio*/}
          <label className="flex flex-col  text-sm text-gray-600">
            <span className="mb-1">Bio</span>
            <textarea
              placeholder="tell about yourself...."
              readOnly={!editMode}
              className={`rounded-md w-auto h-24 px-3 py-2 ${editMode ? "bg-white border border-indigo-200" : "bg-gray-100 border border-gray-200"} text-gray-700`}
              value={Bio}
              style={{ resize: "none", overflow: "hidden" }}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </label>
        </div>

        {/* status */}
        <div className="mt-6 flex items-center gap-3">
          {status.type === "success" && (
            <>
              <Check className="text-green-600" />
              <span className="text-sm text-green-700">{status.message}</span>
            </>
          )}
          {status.type === "error" && (
            <>
              <AlertCircle className="text-red-600" />
              <span className="text-sm text-red-700">{status.message}</span>
            </>
          )}
          {status.type === "pending" && <span className="text-sm text-gray-500">Saving...</span>}
        </div>
      </div>
    </div>
  );
}
