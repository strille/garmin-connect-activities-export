/**
 Usage: 
 	1. Copy this script into the clipboard.
 	2. Login to Garmin Connect and go to the activities page (https://connect.garmin.com/modern/activities).
 	3. Open the browser's console (F12).
 	4. Paste the copied script into the prompt and run.
**/
(function($) {
    var outputFileName = 'Activities-all.csv';
    var instanceName = 'gcActivitiesExport';
    var activitiesIframeSrc = 'https://connect.garmin.com/minactivities';

    // internals
    var context = null;
    var currPage = 1;
    var csvData = '';
    var closed = false;
    var $statusText;
    var $dialog;
    var version = '1.0';

    _reset();
    createDialog();
    startDownload();

    function _reset() {
        try {
            console.clear();
        } catch (e) {}

        // close existing instance, if any
        if (window[instanceName]) {
            window[instanceName].close();
        }
    }

    function close() {
        closed = true;
        $dialog.remove();
    }

    function createButton() {
        return $('<a/>')
            .css({
                color: '#fff',
                textDecoration: 'none',
                backgroundColor: '#0a1f2e',
                cursor: 'default',
                display: 'block',
                position: 'absolute',
                right: '50%',
                top: '50%',
                padding: '10px',
                marginRight: -150,
                width: 300,
                textAlign: 'center'
            });
    }

    function createDialog() {
        $statusText = createButton();

        $dialog = $('<div/>').css({
                zIndex: 9999,
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)'
            })
            .append($statusText)
            .append(
                createButton().text('X').click(close).css({
                    cursor: 'pointer',
                    width: 30,
                    borderRadius: '100%',
                    padding: '1px',
                    marginTop: -18,
                    marginRight: -185
                })
            )
            .appendTo($('body'));
    }

    function downloadCsv() {
        if (getCurrPageNumber() === currPage) {
            showMessage('Processing page ' + currPage + '...');

            $.ajax({
                url: $('.exportCsv', context).attr('href'),
                context: context,
                error: function(e) {
                    showMessage('Please reload the browser and try again.', e);
                },
                success: onFileDownloadSuccess
            });
        } else {
            showMessage('Expexted current page to be ' + currPage + ' instead of ' + getCurrPageNumber() + '.', true);
        }
    }

    function getCurrPageElement() {
        return $('.rich-datascr-act', context);
    }

    function getCurrPageNumber() {
        return parseInt(getCurrPageElement().text().trim());
    }

    function onFileDownloadSuccess(data) {
        if (closed) {
            return;
        }

        data = data.trim() + '\n';

        if (currPage === 1) {
            csvData += data;
        } else {
            var rows = data.split('\n');
            rows = rows.slice(3);
            csvData += rows.join('\n');
        }

        var $nextButton = getCurrPageElement().next();

        if ($nextButton.hasClass('rich-datascr-inact')) {
            $nextButton.trigger('click');
            currPage += 1;
            waitForPage(currPage, downloadCsv);
        } else {
            showMessage('Done!');
            saveData(csvData);
        }
    }

    function saveData(data) {
        var blob = new Blob([data], {
            type: 'text/csv;charset=utf8;'
        });

        // Browsers that support HTML5 download attribute
        if ($statusText[0].download !== undefined) {
            $statusText
                .text('Download CSV file')
                .css({
                    color: '#11a9ed',
                    cursor: 'pointer'
                })
                .attr('href', window.URL.createObjectURL(blob))
                .attr('download', outputFileName);
        } else if (navigator.msSaveBlob) { // IE 10+
            showMessage('Done! (IE should now ask you if you want to save the file)');
            navigator.msSaveBlob(blob, outputFileName);
        } else { // Browsers with no download support, just dump the csv in a textarea.
            showMessage('Done! (CSV data listed in text box below).');
            $('<textarea/>').text(data).css({
                position: 'absolute',
                left: '0%',
                width: '100%',
                bottom: 0,
                height: '30%'
            }).appendTo($dialog);
        }
    }

    function showMessage(message, error) {
        $statusText
            .css('color', error ? '#f55' : '#fff')
            .text(error ? 'Error: ' + message + ' (version: ' + version + ')' : message);

        var consoleMessage = instanceName + ' ' + version + ': ' + message;

        if (error) {
            console.error(consoleMessage);
            if (error instanceof Error) {
                console.log(error);
            }
        } else {
            console.log(consoleMessage);
        }
    }

    function startDownload() {
        var $activitiesIframe = $('iframe[src=\'' + activitiesIframeSrc + '\']');

        if ($activitiesIframe.length > 0) {
            try {
                context = $activitiesIframe.contents()[0];
            } catch (e) {
                showMessage('Could not get iframe context.', e);
                return;
            }

            if (context) {
                if (getCurrPageNumber() === 1) {
                    downloadCsv();
                } else {
                    var $firstPageButton = $('.rich-datascr-button:contains(««)', context);
                    if ($firstPageButton.length > 0) {
                        showMessage('Navigating to first page...');
                        $firstPageButton.trigger('click');
                        waitForPage(1, downloadCsv);
                    } else {
                        showMessage('Could not find button to navigate to first page.', true);
                    }
                }
            } else {
                showMessage('iframe context not set.', true);
            }
        } else {
            showMessage('Could not find activities iframe.', true);
        }
    }

    function waitForPage(pageNumber, callback) {
        var t = setInterval(function() {
            if (getCurrPageNumber() === pageNumber || closed) {
                clearInterval(t);
                if (!closed) {
                    callback();
                }
            }
        }, 300);
    }

    window[instanceName] = {
        close: close
    };
})(jQuery);
