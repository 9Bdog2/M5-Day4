import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import BlogItem from "../blog-item";
/* import posts from "../../../data/posts.json"; */
export default class BlogList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      blogs : []
    };
  }

  componentDidMount() {
    fetch("http://localhost:3001/blogPosts")
    .then(res => res.json())
    .then(result => {
      this.setState({
        blogs: result
      });
    })
  }


  render() {
    const { blogs } = this.state;
    return (
      <Row>
        {/* {posts.map((post) => (
          <Col md={4} style={{ marginBottom: 50 }}>
            <BlogItem key={post.title} {...post} />
          </Col>
        ))} */}
        {blogs.map((blog) => (
          <Col md={4} style={{ marginBottom: 50 }}>
            <BlogItem key={blogs.title} {...blog} />
          </Col>
        ))} 
      </Row>
    );
  }
}
