import React, { useState } from 'react';
import List from "@/app/ui/components/bault/list";
import FileUploadButton from "@/app/ui/components/bault/uploadButton";
import { getLists } from '@/app/lib/data';

interface ListContainerProps {
  type: string
}

const ListContainer: React.FC<ListContainerProps> = ({ type }) => {
  const [list, setList] = useState([
    { id: 1, name: "Wordlist 1" },
    { id: 2, name: "Wordlist 2" },
    { id: 3, name: "Wordlist 3" },
    { id: 4, name: "Wordlist 1" },
    { id: 5, name: "Wordlist 2" },
    { id: 6, name: "Wordlist 3" },
  ]);
  
  const handleListUploadSuccess = (updatedList: React.SetStateAction<{ id: number; name: string; }[]>) => {
    setList(updatedList);
    getLists("fakeNetworks")
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col items-center justify-center p-8 mt-8">
        <div className="flex flex-col gap-4">
          <List type={type} lists={list} onUploadSuccess={handleListUploadSuccess} />
          <FileUploadButton type={type} list={list} onUploadSuccess={handleListUploadSuccess} />
        </div>
      </div>
    </div>
  );
};

export default ListContainer;
