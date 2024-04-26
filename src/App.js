import React, { useRef, useState, useEffect, useMemo } from 'react';

import {Routes, Route, Navigate, useLocation, NavLink, useParams, useNavigate} from "react-router-dom";
import { useRecoilState, atom } from 'recoil';
import { produce } from 'immer';

const todosAtom = atom({
  key: "app/todosAtom",
  default: [
    {id: 3, regDate: "2024-04-24 12:12:12", content: "코딩"},
    {id: 2, regDate: "2024-04-24 12:12:12", content: "운동"},
    {id: 1, regDate: "2024-04-24 12:12:12", content: "공부"}
  ]
});

function useTodossTate() {
  const [todos, setTodos] = useRecoilState(todosAtom);
  const lastTodoIdRef = useRef(todos.lenth == 0 ? 0 : todos[0].id);

  const addTodo = (content) => {
    const id = ++lastTodoIdRef.current;
    const regDate = "2024-04-24 12:12:12";

    const newTodo = {
      id,
      regDate,
      content
    }

    // 기존방식
    // const newTodos = [newTodo, ...todos];
    const newTodos = produce(todos, (draft) => {
      draft.unshift(newTodo);
    })

    setTodos(newTodos);
  }

  const findIndexById = (id) => todos.findIndex((todo) => todo.id == id);

  const findTodoById = (id) => {
    const index = findIndexById(id);

    if ( index == -1) return null;

    return todos[index];
  }

  const removeTodoById = (id) => {
    const index = findIndexById(id);

    if ( index == -1 ) return;

    // 기존 방식
    // const newTodos = todos.filter((_, _index) => index != _index);

    const newTodos = produce(todos, (draft) => {
      draft.splice(index, 1);
    })

    setTodos(newTodos);
  }

  const modifyTodoById = (id, content) => {
    const index = findIndexById(id);

    if ( index == -1 ) return;

    // 기존 방식
    // const newTodos = todos.map((todo, _index) => 
    //   index == _index ? {...todo, content} : todo);

    const newTodos = produce(todos, (draft) => {
      draft[index].content = content;
    })


    setTodos(newTodos);
  }

  return {
    todos,
    addTodo,
    removeTodoById,
    modifyTodoById,
    findTodoById
  };
}

function TodoListItem({todo}) {
  const todosState = useTodossTate();

  return (
    <>
      <li key={todo.id}>
        {todo.id} : {todo.content}
        <NavLink to={`/edit/${todo.id}`} className='btn btn-sm'>수정</NavLink>
        <button className='btn btn-sm'
        onClick={() => window.confirm(`${todo.id}번 할 일을 삭제하시겠습니까?`) &&
        todosState.removeTodoById(todo.id)}>
          삭제
        </button>
      </li>
    </>
  );
}

function TodoListPage() {
  const todosState = useTodossTate();

  return (
    <>
      <h1>할 일 리스트</h1>

      <ul>
        {todosState.todos.map((todo) => (
          <TodoListItem key={todo.id} todo={todo}/>
        ))}
      </ul>
    </>
  );
}

function TodoEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const todosState = useTodossTate();
  const todo = todosState.findTodoById(id);

  const onSubmit = (e) => {
    e.preventDefault();

    const form = e.target;

    form.content.value = form.content.value.trim();

    if ( form.content.value.length == 0 ) {
      alert("할 일을 입력해주세요");
      form.content.focus();

      return;
    }

    todosState.modifyTodoById(todo.id, form.content.value);

    navigate("/list", {replace : true});
  }

  return (
    <>
      <h1>할 일 수정</h1>
      <form onSubmit={onSubmit} style={{display: "inline-block"}}>
        <input
          className='input input-outlined input-sm'
          type="text"
          name="content"
          placeholder='할 일'
          defaultValue={todo.content}
          />
        <button className='btn btn-sm' type='submit'>수정완료</button>
        <button className='btn btn-sm' type='button' onClick={() => navigate("/list")}>수정취소</button>
      </form>
    </>
  );

}

function TodoWritePage() {
  const todosState = useTodossTate();

  const onSubmit = (e) => {
    e.preventDefault();

    const form = e.target;

    form.content.value = form.content.value.trim();

    if ( form.content.value.length == 0 ) {
      alert("할 일을 입력해주세요");
      form.content.focus();

      return;
    }

    todosState.addTodo(form.content.value);

    form.content.value = "";
    form.content.focus();
  }

  return (
    <>
      <h1>할 일 작성</h1>
      <form onSubmit={onSubmit}>
        <input className="input input-bordered my-5 mr-2" type="text" name="content" placeholder='할 일을 작성해주세요'/>
        <input type="submit" value="작성" className='input input-bordered'/>
      </form>

      <div>
        {todosState.todos.length}
      </div>
    </>
  );
}


export default function App() {
    const location = useLocation();

    return (
      <>
      <header>
        <NavLink
          to="/list"
          style={({ isActive })=>({ color: isActive ? "red" : null })}
        >
          리스트
        </NavLink>
        &nbsp;/&nbsp;
        <NavLink
          to="/write"
          style={({ isActive })=>({ color: isActive ? "red" : null })}
        >
          작성
        </NavLink>
        <hr />
        주소 : {location.pathname}
      </header>

      <Routes>
        <Route path="/list" element={<TodoListPage />} />
        <Route path="/write" element={<TodoWritePage />} />
        <Route path="/edit/:id" element={<TodoEditPage />} />
        <Route path="*" element={<Navigate to="/write" />} />
      </Routes>

      </>
    );
}