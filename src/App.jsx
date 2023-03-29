import { useEffect, useRef, useState } from "react";
import Auth from "./components/Auth";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "./config/config";
import { ref, uploadBytes } from "firebase/storage";

function App() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [fileUpload, setFileUpload] = useState(null);

  const useRating = useRef();

  const addMovie = async () => {
    try {
      const docRef = await addDoc(collection(db, "movies"), {
        title: title,
        raging: useRating.current.value,
        userId: auth?.currentUser?.uid,
      });
      getMovies();
      console.log(docRef);
    } catch (error) {
      console.log(error);
    }
  };

  const getMovies = async () => {
    try {
      const { docs } = await getDocs(collection(db, "movies"));
      const data = docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      // console.log(data);
      setMovies(data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMovie = async (id) => {
    try {
      const movieDoc = doc(db, "movies", id);
      await deleteDoc(movieDoc);
      getMovies();
    } catch (error) {
      console.log(error);
    }
  };

  const updateMovie = async (id) => {
    try {
      const movieDoc = doc(db, "movies", id);
      await updateDoc(movieDoc, { title: updateTitle });
      getMovies();
    } catch (error) {
      console.log(error);
    }
  };

  const uploadFile = async () => {
    if (!fileUpload) return;
    try {
      const fileFolderRef = ref(storage, `projectFile/${fileUpload.name}`);
      await uploadBytes(fileFolderRef, fileUpload);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMovies();
  }, []);

  return (
    <div className="App">
      <div>
        <input
          type="text"
          placeholder="movie title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="number" placeholder="rating ..." ref={useRating} />
        <button onClick={addMovie}>Submit Movie</button>
      </div>

      <Auth />
      {movies?.map((item) => {
        return (
          <div key={item.id}>
            <h1>{item.title}</h1>
            <div>{item.raging}</div>
            <hr />
            <button onClick={() => deleteMovie(item.id)}>Delete movie</button>
            <input
              type="text"
              placeholder="new title..."
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
            />
            <button onClick={() => updateMovie(item.id)}>Update title</button>
          </div>
        );
      })}

      <div>
        <input type="file" onChange={(e) => setFileUpload(e.target.files[0])} />
        <button onClick={uploadFile}>Upload file</button>
      </div>
    </div>
  );
}

export default App;
