// Blog Class - จัดการข้อมูลบล็อก
class Blog { // ใช้จัดการข้อมูลบล็อก โดยมี ID, หัวข้อ, เนื้อหา, แท็ก และ วันที่สร้าง/แก้ไข เมื่อลงทะเบียนบล็อกใหม่จะกำหนดค่าทั้งหมดอัตโนมัติ
    constructor(id, title, content, tags = []) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.tags = tags;
      this.createdDate = new Date();
      this.updatedDate = new Date();
    }
  
    update(title, content, tags) { //ใช้ อัปเดตข้อมูลบล็อก โดย:เปลี่ยน หัวข้อ (title)เปลี่ยน เนื้อหา (content)เปลี่ยน แท็ก (tags)อัปเดต วันที่แก้ไข (updatedDate) เป็นเวลาปัจจุบัน
      this.title = title;
      this.content = content;
      this.tags = tags;
      this.updatedDate = new Date();
    }
  
    getFormattedDate() { //ใช้ แปลงวันที่แก้ไข
      return this.updatedDate.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  
  // BlogManager Class - จัดการข้อมูลบล็อกใน Array และ LocalStorage
  class BlogManager {
    constructor() {
      this.blogs = [];
    }
  
    addBlog(title, content, tags) { //เพิ่ม บล็อก
      const blog = new Blog(Date.now(), title, content, tags);
      this.blogs.push(blog);
      this.sortBlogs();
      this.saveToLocalStorage();
      return blog;
    }
  
    updateBlog(id, title, content, tags) { //อัพเดตบล็อค
      const blog = this.getBlog(id);
      if (blog) {
        blog.update(title, content, tags);
        this.sortBlogs();
        this.saveToLocalStorage();
      }
      return blog;
    }
  
    deleteBlog(id) { //ลบบล็อค
      this.blogs = this.blogs.filter((blog) => blog.id !== id);
      this.saveToLocalStorage();
    }
  
    getBlog(id) { //ค้นหาบล็อกที่มี ID ตรงกัน
      return this.blogs.find((blog) => blog.id === id);
    }
  
    sortBlogs() { //เรียงลำดับบล็อกตาม วันที่แก้ไขล่าสุด
      this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
    }
  
    saveToLocalStorage() { //บันทึกรายการบล็อก
      localStorage.setItem("blogs", JSON.stringify(this.blogs));
    }
  
    loadFromLocalStorage() { //โหลดบล็อก
      const storedBlogs = localStorage.getItem("blogs");
      if (storedBlogs) {
        this.blogs = JSON.parse(storedBlogs).map(
          (blog) => new Blog(blog.id, blog.title, blog.content, blog.tags)
        );
      }
    }
  
    filterByTag(tag) { //ค้นหาบล็อกที่มี แท็กตรงกับค่าที่ระบุ
      return this.blogs.filter((blog) => blog.tags.includes(tag));
    }
  }
  
  // UI Class - จัดการการแสดงผล
  class BlogUI {
    constructor(blogManager) {
      this.blogManager = blogManager;
      this.initElements();
      this.initEventListeners();
      this.render();
    }
  
    initElements() {
      this.form = document.getElementById("blog-form"); //เพิ่ม/แก้ไขบล็อก
      this.titleInput = document.getElementById("title"); //หัวข้อบล็อก
      this.contentInput = document.getElementById("content"); //เนื้อหาบล็อก
      this.tagsInput = document.getElementById("tags"); // ช่องกรอกแท็ก
      this.editIdInput = document.getElementById("edit-id"); //ซ่อนค่า ID ของบล็อกที่กำลังแก้ไข
      this.formTitle = document.getElementById("form-title"); //หัวข้อของฟอร์ม (ใช้เปลี่ยนชื่อเป็น "แก้ไขบล็อก" เมื่อต้องการอัปเดต)
      this.cancelBtn = document.getElementById("cancel-btn"); //ปุ่ม ยกเลิกการแก้ไข
      this.blogList = document.getElementById("blog-list"); //ที่ใช้แสดง รายการบล็อก
      this.tagFilter = document.getElementById("tag-filter"); // ช่องค้นหาแท็ก
    }
  
    initEventListeners() { //กำหนด Event
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
  
      this.cancelBtn.addEventListener("click", () => {
        this.resetForm();
      });
  
      this.tagFilter.addEventListener("input", () => {
        this.render();
      });
    }
  
    handleSubmit() {
      const title = this.titleInput.value.trim(); //ดึงหัวข้อจากฟอร์มและลบช่องว่าง
      const content = this.contentInput.value.trim(); //ดึงเนื้อหาจากฟอร์มและลบช่องว่าง
      const tags = this.tagsInput.value.split(",").map((tag) => tag.trim()); // แปลงแท็กเป็น array
      const editId = parseInt(this.editIdInput.value); //ดึง ID ของบล็อกที่กำลังแก้ไข
  
      if (title && content) {
        if (editId) {
          this.blogManager.updateBlog(editId, title, content, tags);
        } else {
          this.blogManager.addBlog(title, content, tags);
        }
        this.resetForm();
        this.render();
      }
    }
  
    editBlog(id) { //แก้ไขบล็อก
      const blog = this.blogManager.getBlog(id); //ดึงข้อมูลบล็อก
      if (blog) {
        this.titleInput.value = blog.title;
        this.contentInput.value = blog.content;
        this.tagsInput.value = blog.tags.join(", "); // แสดงแท็กเป็น string
        this.editIdInput.value = blog.id;
        this.formTitle.textContent = "แก้ไขบล็อก";
        this.cancelBtn.classList.remove("hidden");
        window.scrollTo(0, 0);
      }
    }
  
    deleteBlog(id) { //ลบบล็อก
      if (confirm("ต้องการลบบล็อกนี้ใช่หรือไม่?")) {
        this.blogManager.deleteBlog(id);
        this.render();
      }
    }
  
    resetForm() { //รีเซ็ต บล็อก
      this.form.reset();
      this.editIdInput.value = "";
      this.formTitle.textContent = "เขียนบล็อกใหม่";
      this.cancelBtn.classList.add("hidden");
    }
  
    render() {
      const filterTag = this.tagFilter.value.trim();
      let blogsToRender = this.blogManager.blogs;
  
      if (filterTag) {
        blogsToRender = this.blogManager.filterByTag(filterTag);
      }
  
      this.blogList.innerHTML = blogsToRender
        .map(
          (blog) => `
            <div class="blog-post">
                <h2 class="blog-title">${blog.title}</h2>
                <div class="blog-date">อัปเดตเมื่อ: ${blog.getFormattedDate()}</div>
                <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
                <div class="blog-tags">แท็ก: ${blog.tags.join(", ") || "ไม่มีแท็ก"}</div>
                <div class="blog-actions">
                    <button class="btn-edit" onclick="blogUI.editBlog(${blog.id})">แก้ไข</button>
                    <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
                </div>
            </div>
        `
        )
        .join("");
    }
  }
  
  // เริ่มต้นใช้งาน
  const blogManager = new BlogManager();
  blogManager.loadFromLocalStorage(); // โหลดข้อมูลจาก LocalStorage
  const blogUI = new BlogUI(blogManager);