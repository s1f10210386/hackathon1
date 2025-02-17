import { commentBoxShowAtom, messageListAtom, showModelAtom } from "@/utils/jotai";
import { baseURL } from "@/utils/url";
import { useAtom } from "jotai";
import styles from "./CommentBox.module.css"
import { Button, TextField } from "@mui/material";
import { getCurrentTimestamp } from "@/utils/CurrentTime";
import { useState } from "react";
import SendIcon from '@mui/icons-material/Send';

export function CommentBox(){

    const [messageList, setMessageList] = useAtom(messageListAtom);
    const [messageContent, setMsseageContent] = useState<string>('');

    const [showModel, setShowModel] = useAtom(showModelAtom);
    const [commentBoxShow, setCommentBoxShow] = useAtom(commentBoxShowAtom);

    type PostObject = {
        date: string;
        content: string;
        timestamp: string;
    }

    const addContent = async(postObject: PostObject)=>{
        const response = await fetch('/api/postDB_message_calendar',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postObject),
        })

        const data = await response.json();
        const DB_calendar = data.calendar;
        console.log("DB_calendar",DB_calendar)
        const DB_message = data.message;
        console.log("DB_message",DB_message)
        return{
            calendar: DB_calendar,
            message: DB_message
        }
    }

    const scoringGPT =async(content : string) =>{
        const response= await fetch('/api/scoringGPTAPI', {
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(content),
        })
        const data = await response.json();
        return data;
    }

    //emotinalValueをDBに追加
    const addEmotinalValueDB =async( calendarId:number ,emotinalValue:number)=>{
        const response = await fetch('/api/addEmotinalValueAPI',{
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({ id: calendarId, emotinalValue: emotinalValue}),
        })
        const data = await response.json();
        return data;
    }

    const runGPT = async(calendarId: number)=>{
        if(messageContent === "") return;
        const GPTScoring = await scoringGPT(messageContent);
        //ここでGPTscoringの内容をDBに接続
        await addEmotinalValueDB(calendarId,GPTScoring);
    }



    const run = async()=>{
        if(messageContent === "") return;
        const nowString = getCurrentTimestamp();
        const now = new Date().toISOString()
        const addObject ={
            date:now,
            content:messageContent,
            timestamp: nowString,
        }
        const newCalendarData = await addContent(addObject)
        const MessageObject = newCalendarData.message
        setMessageList((prevMessageList)=>[...prevMessageList, MessageObject]);
        setMsseageContent("");
        setShowModel(true);
        setCommentBoxShow(false)

        // runGPT(newCalendarData.calendar.id);
    }

    return (
        <div className={styles.container}>
            <div className={styles.inputContainer}>
                <TextField 
                    className={styles.textFieldStyle}
                    
                    variant="outlined"
                    multiline
                    rows={1}
                    placeholder="明日の自分へ"
                    value={messageContent}
                    onChange={(e) => setMsseageContent(e.target.value)}
                    InputProps={{ style: { borderRadius: 30 } }}
                    // style={{ borderRadius: "50px" }}
                />
                <Button 
                    variant="contained" 
                    style={{ backgroundColor: '#91CAD3', color: 'white',borderRadius: '18px'  }}
                    onClick={run} 
                    className={styles.sendButton}
                    startIcon={<SendIcon/>}
                >
                </Button>
            </div>
        </div>
    )
}