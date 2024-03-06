import React from 'react';
import { Container } from 'reactstrap';
import CategoryPage from './category/Category';

const Index = (props) => {
  return (
    <div className="my-4">
      <CategoryPage {...props} />
    </div>
  );
};

export default Index;
