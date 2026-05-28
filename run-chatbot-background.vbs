Set WshShell = CreateObject("WScript.Shell")
' Chạy file .bat ở chế độ ẩn (tham số 0)
WshShell.Run chr(34) & "start-chatbot.bat" & Chr(34), 0
Set WshShell = Nothing
