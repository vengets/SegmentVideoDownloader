# Segment Video Downloader

Segment Video Downloader is a tool for downloading any file that comprises multiple segments.

# Syntax:
```sh
node start <url> <start> <end>
```
 start - integer value indicating starting segment
 end - integer value indicating ending segment
# Example:
To download http://somedomain.com/somefile.mp4, 
First identify number of segments using a developer tools. Let's assume it has 100 segments.

Start segment http://somedomain.com/somefile.mp4?t=1

End segment http://somedomain.com/somefile.mp4?t=100

Issue the below command for downloading 1 to 100 segments of the video,
 ```sh
node start "http://somedomain.com/somefile.mp4?t={}" 1 100
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
