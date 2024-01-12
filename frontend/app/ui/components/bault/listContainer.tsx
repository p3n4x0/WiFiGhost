import React, { useEffect, useState } from 'react';
import List from "@/app/ui/components/bault/list";
import FileUploadButton from "@/app/ui/components/bault/uploadButton";
import { fetchList } from '@/app/lib/data';

interface ListContainerProps {
  type: string
}

const ListContainer: React.FC<ListContainerProps> = ({ type }) => {
  const [list, setList] = useState<string[]>([]);
  
  const handleListUploadSuccess = (updatedList: string[]) => {
    setList(updatedList)
  };
  


  useEffect(() => {
    fetchList(setList, type);
  }, []); 

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col items-center justify-center p-8 mt-8">
        <div className="flex flex-col gap-4">
          <List type={type} lists={list} onUploadSuccess={handleListUploadSuccess} />
          <FileUploadButton type={type} lists={list} onUploadSuccess={handleListUploadSuccess} />
        </div>
      </div>
    </div>
  );
};

export default ListContainer;
